<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeptAchievement extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'module_id',
        'recipient_name',
        'topcit_level',
        'year_level',
        'school_year_attended',
        'exam_name',
        'title',
        'date_awarded',
        'notes',
        'status',
        'rejection_reason',
        'submitted_by',
        'rejected_by',
        'vpaa_approved_by',
        'vpaa_approved_at',
    ];

    public function module()
    {
        return $this->belongsTo(AchievementModule::class, 'module_id');
    }
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
}
