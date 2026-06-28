<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentData extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'total_enrolled',
        'male_count',
        'female_count',
        'new_students',
        'old_students',
        'notes',
        'status',
        'rejection_reason',
        'submitted_by',
        'approved_by',
        'approved_at',
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
}