<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// One report per program per academic period: the batch of student
// movement records (dropped / transferee / shiftee) the Dean and VPAA approve.
class RetentionReport extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'status',
        'rejection_reason',
        'approved_by',
        'approved_at',
        'rejected_by',
        'vpaa_approved_by',
        'vpaa_approved_at',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
    public function records()
    {
        return $this->hasMany(RetentionRecord::class)->orderBy('record_date');
    }
}
