<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'employee_data';

    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'employee_name',
        'employee_no',
        'position',
        'employment_type',
        'date_hired',
        'highest_education',
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
}
